import type {PlasmoMessaging} from "@plasmohq/messaging"

// This API support only low amount of requests
// It shouldn't be used for big amount of users
const API_URL_PREFIX = `https://api.goabout.com/geocoder/encode?query=`

// Response type
const EmbeddedType = 'http://rels.goabout.com/location';
type ApiResponseType = {
  locationHrefs: string[];
  _links: {
    self: {
      href: string;
    }
  };
  _embedded: {
    [EmbeddedType]: Array<{
      type: string;
      label: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
      postalCode: string;
      street: string;
      city: string;
      _links: {
        self: {
          href: string;
        }
      };
    }>;
  };
}

function getMapUrl(lat, lon) {
  return `https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${lat},${lon}&t=&z=14&ie=UTF8&iwloc=B&output=embed`;
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const postCode = req.body.postCode;

  if (!postCode) {
    return res.send(null);
  }

  try {
    const param = encodeURIComponent(postCode.replace(/\s/g, '').toUpperCase());
    const requestUrl = `${API_URL_PREFIX}${param}`;
    const response = await fetch(requestUrl, {
      headers: {
        'accept': 'application/json',
      }
    });
    const data: ApiResponseType = await response.json();

    if (!data?._embedded?.[EmbeddedType]?.[0]?.coordinates) {
      return res.send(null);
    }

    const {latitude, longitude} = data?._embedded?.[EmbeddedType]?.[0]?.coordinates;
    const mapUrl = getMapUrl(latitude, longitude);
    res.send(mapUrl);

  } catch (error) {
    res.send(null);
    console.error(error);
  }
}

export default handler