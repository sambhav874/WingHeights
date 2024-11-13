import Image from 'next/image'



export function Media({ file } : any) {
  console.log('Media component received file prop:', file);

 

  const { url: baseUrl, width, height, alternativeText, formats } = file

  console.log('Destructured data:', { baseUrl, width, height, alternativeText, formats });

  
  const imageUrl =  baseUrl

  if (!imageUrl) {
    console.error('Image URL is undefined. Available data:', file.data);
    return null;
  }

  const fullImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${imageUrl}`;
  

  return (
    <div className="my-8">
      <Image
        src={fullImageUrl}
        width={width || 800}
        height={height || 600}
        alt={alternativeText || 'Image'}
        className="rounded-lg shadow-lg"
      />
    </div>
  )
}