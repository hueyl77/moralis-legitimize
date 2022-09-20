import Image from 'next/image';

const GalleryHome: React.FC = ({ children }) => {

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-4 md:pb-8">

        <div className="grid grid-cols-12 gap-3 mt-12 md:mt-20" data-aos-id-gallery>
          <div className="col-span-4">
            <Image src="/images/artist-park-paiting.jpeg" width="360" height="270" alt="About grid 01" data-aos="fade-down" data-aos-anchor="[data-aos-id-gallery]" />
          </div>
          <div className="col-span-3">
            <Image src="/images/author-writing.jpeg" width="270" height="270" alt="About grid 02" data-aos="fade-down" data-aos-anchor="[data-aos-id-gallery]" data-aos-delay="100" />
          </div>
          <div className="col-span-5">
            <Image src="/images/digital-signature-3.jpeg" width="450" height="270" alt="About grid 03" data-aos="fade-down" data-aos-anchor="[data-aos-id-gallery]" data-aos-delay="200" />
          </div>
          <div className="col-span-5">
            <Image src="/images/musician-composing.jpeg" width="450" height="270" alt="About grid 04" data-aos="fade-down" data-aos-anchor="[data-aos-id-gallery]" data-aos-delay="300" />
          </div>
          <div className="col-span-3">
            <Image src="/images/pexels-signed1.jpeg" width="270" height="270" alt="About grid 05" data-aos="fade-down" data-aos-anchor="[data-aos-id-gallery]" data-aos-delay="400" />
          </div>
          <div className="col-span-4">
            <Image src="/images/artist-painting-art.jpeg" width="360" height="270" alt="About grid 06" data-aos="fade-down" data-aos-anchor="[data-aos-id-gallery]" data-aos-delay="500" />
          </div>
        </div>

        </div>
      </div>
    </section>
  );
}

export default GalleryHome;
