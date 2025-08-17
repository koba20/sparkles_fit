import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ogbinybtbasmkvagvgai.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYmlueWJ0YmFzbWt2YWd2Z2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODUyNTUsImV4cCI6MjA2OTA2MTI1NX0.QmOLiZTU0NqUNPdZZXWDFSjiO0qIcLLQZkeAXGWA_w8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testContactMessagesTable() {
  console.log('🔍 Testing contact_messages table...');

  try {
    // Test if the table exists by attempting to select from it
    const { data, error } = await supabase
      .from('contact_messages')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing contact_messages table:', error.message);
      console.log('\nPlease follow the instructions in CONTACT_MESSAGES_SETUP.md to create the table.');
    } else {
      console.log('✅ contact_messages table exists and is accessible!');
      
      // Try to insert a test message
      const testMessage = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Message',
        message: 'This is a test message to verify the contact_messages table is working correctly.'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('contact_messages')
        .insert([testMessage])
        .select();
      
      if (insertError) {
        console.error('❌ Error inserting test message:', insertError.message);
        console.log('\nThe table exists but there might be issues with permissions or RLS policies.');
      } else {
        console.log('✅ Successfully inserted a test message!');
        console.log('✅ The contact_messages table is fully functional.');
        
        // Clean up the test message
        if (insertData && insertData[0] && insertData[0].id) {
          const { error: deleteError } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', insertData[0].id);
          
          if (deleteError) {
            console.log('⚠️ Could not delete the test message:', deleteError.message);
          } else {
            console.log('✅ Test message cleaned up successfully.');
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testContactMessagesTable();