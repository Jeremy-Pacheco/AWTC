const axios = require('axios');
const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

exports.getVolunteerOpportunities = async (req, res) => {
  try {
    const response = await axios.get("https://www.volunteerconnector.org/api/search/", {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching external opportunities:", error.message);
    res.status(500).json({ message: "Error fetching external opportunities", error: error.message });
  }
};
