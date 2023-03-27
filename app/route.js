import axios from "axios";
// const fetchItems = async (req, res) => {};
const lat = 40.7323017;
const lng = -73.9873417;
export async function GET() {
  const req = await axios.get(
    `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}&term=resturants&radius=450&limit=4`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_YELP_API_KEY}`,
      },
      params: {
        // latitude: center.lat,
        // longitude: center.lng,
        // term: "resturants",
        // radius: 500,
        // limit: 20,
        sort_by: "rating",
      },
    }
  );
  // const response = await request.data.businesses;
  try {
    return req;
  } catch (err) {
    return err;
  }
}

// export default fetchItems;
