import { Helmet } from "react-helmet-async";

const MetaTag = (props: any) => {
  return (
    <Helmet>
      <title>{`Cherish | ${props.title}`}</title>

      <meta name="description" content={props.description} />
      <meta name="keywords" content={props.keywords} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={`Cherish | ${props.title}`} />
      <meta property="og:site_name" content="Cherish" />
      <meta property="og:description" content={props.description} />
      <meta property="og:image" content={props.imgsrc} />
      <meta property="og:url" content={`https://dy0r10h1o4v6b.cloudfront.net${props.url}`} />

      <meta name="twitter:title" content={`Cherish | ${props.title}`} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={props.imgsrc} />

      <link rel="canonical" href={`https://dy0r10h1o4v6b.cloudfront.net${props.url}`} />
    </Helmet>
  );
};

export default MetaTag;
