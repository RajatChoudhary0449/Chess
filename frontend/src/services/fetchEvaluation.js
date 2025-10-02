import axios from 'axios';
export async function fetchEvaluation(data={}) {
  const response = await axios.post("https://chess-api.com/v1",data, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.data;
}
