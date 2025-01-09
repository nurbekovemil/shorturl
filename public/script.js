
document.getElementById('shortenForm').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const originalUrl = document.getElementById('originalUrl').value;
  
    const response = await fetch('/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ originalUrl }),
    });
  
    if (response.ok) {
      const result = await response.json();
      document.getElementById('result').innerText = `Shortened URL: /${result.shortUrl}`;
    } else {
      document.getElementById('result').innerText = 'Error creating shortened URL.';
    }
});
