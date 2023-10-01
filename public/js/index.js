
/* NOTE: TEST CODE FOR PAYMONGO API
document.getElementById('donate').addEventListener('click', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('amount').value;
    const name = document.getElementById('name').value;
    const res = await fetch('/donate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, name })
    })
    const data = await res.json();
    console.log(data)
    window.location.href = data;
}); */