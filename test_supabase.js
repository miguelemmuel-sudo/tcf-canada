const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fgctytyvmhncrxqljjwz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnY3R5dHl2bWhuY3J4cWxqand6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1ODY1ODgsImV4cCI6MjEwMDE2MjU4OH0.mH5Q5vSUzRi-smqhAmwlhGiF2lOwuglW1Sn94iYpb8A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log("Testing connection to Supabase...");
  const { data, error } = await supabase
    .from('active_sessions')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error accessing table active_sessions:", error.message);
    process.exit(1);
  } else {
    console.log("Table active_sessions exists! Data:", data);
    process.exit(0);
  }
}

checkTable();
