import axios from "axios";
export async function GET(request, { params }) {
  const { lat, lng, radius } = params;

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
  try {
    const response = await req.data.businesses;
    // console.log(params);
    return Response.json(response);
  } catch (err) {
    return new Response(err);
  }
}

// export default fetchItems;
