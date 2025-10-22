import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Finding matches for user:', user.id);

    // Get user's embedding
    const { data: userEmbedding, error: userEmbeddingError } = await supabaseClient
      .from('user_embeddings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (userEmbeddingError || !userEmbedding) {
      return new Response(
        JSON.stringify({ error: 'User embedding not found. Please generate embeddings first.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userEmbeddingVector = JSON.parse(userEmbedding.embedding_data);

    // Get all other users' embeddings
    const { data: otherEmbeddings, error: otherEmbeddingsError } = await supabaseClient
      .from('user_embeddings')
      .select('*')
      .neq('user_id', user.id);

    if (otherEmbeddingsError) {
      throw otherEmbeddingsError;
    }

    if (!otherEmbeddings || otherEmbeddings.length === 0) {
      return new Response(
        JSON.stringify({ matches: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate similarity scores
    const matches = otherEmbeddings.map(otherUser => {
      const otherVector = JSON.parse(otherUser.embedding_data);
      const similarity = cosineSimilarity(userEmbeddingVector, otherVector);
      
      return {
        user_id: otherUser.user_id,
        similarity_score: similarity,
      };
    })
    .filter(match => match.similarity_score > 0.7) // Only matches with >70% similarity
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, 10); // Top 10 matches

    console.log(`Found ${matches.length} matches`);

    // Store matches in database
    const matchRecords = matches.map(match => ({
      user_id: user.id,
      matched_user_id: match.user_id,
      similarity_score: match.similarity_score,
      match_reason: `${(match.similarity_score * 100).toFixed(1)}% compatibility based on shared interests`,
      status: 'suggested',
    }));

    // Delete old matches and insert new ones
    await supabaseClient
      .from('matches')
      .delete()
      .eq('user_id', user.id);

    if (matchRecords.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('matches')
        .insert(matchRecords);

      if (insertError) {
        console.error('Error inserting matches:', insertError);
      }
    }

    // Fetch full profile data for matches
    const matchedUserIds = matches.map(m => m.user_id);
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .in('user_id', matchedUserIds);

    if (profilesError) {
      throw profilesError;
    }

    const enrichedMatches = matches.map(match => {
      const profile = profiles?.find(p => p.user_id === match.user_id);
      return {
        ...match,
        profile,
      };
    });

    return new Response(
      JSON.stringify({ matches: enrichedMatches }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Match finding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});