import { Helmet } from "react-helmet-async";

const MetaTag = (props: any) => {
  return (
    <Helmet>
      <title>{`${props.title} | Cherish`}</title>

      <meta name="description" content={props.description} />
      <meta name="keywords" content={props.keywords} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${props.title} | Cherish`} />
      <meta property="og:site_name" content="Cherish" />
      <meta property="og:description" content={props.description} />
      <meta property="og:image" content={props.imgsrc} />
      <meta property="og:url" content={`https://cherishhh.shop${props.url}`} />

      <meta name="twitter:title" content={`${props.title} | Cherish`} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={props.imgsrc} />

      <link rel="canonical" href={`https://cherishhh.shop${props.url}`} />
    </Helmet>
  );
};

export default MetaTag;
