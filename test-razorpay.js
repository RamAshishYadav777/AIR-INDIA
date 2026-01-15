// Test script to check if Razorpay order creation works
const SUPABASE_URL = "https://tbwfwvmqwwlzuhxcqqov.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRid2Z3dm1xd3dsenVoeGNxcW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ4NTYsImV4cCI6MjA3OTYzMDg1Nn0.E3I5IQHOI2Fflm74Wzq6FSz8TeXi1nSA3wy2vIAhgJk";

async function testRazorpayOrder() {
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/create-razorpay-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ amount: 500000 })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);

        if (response.ok) {
            console.log('✅ SUCCESS! Order created:', data);
        } else {
            console.log('❌ ERROR:', data);
        }
    } catch (error) {
        console.error('❌ Request failed:', error);
    }
}

testRazorpayOrder();
