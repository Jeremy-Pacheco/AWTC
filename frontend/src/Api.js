fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=TU_API_KEY')
  .then(response => {
    if (!response.ok) throw new Error('HTTP error: ' + response.status);
    return response.json();
  })
  .then(data => {
    // Aquí tienes la lista de fuentes en data.items
    console.log(data.items);
  })
  .catch(error => {
    console.error('Error al consumir Google Fonts API:', error.message);
  });
