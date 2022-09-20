import MainLayout from '../components/layouts/MainLayout'
import PageIllustration from '../components/shared/PageIllustration'

import HeroHome from '../components/home/HeroHome';
import FeatureItems from '../components/home/FeatureItems';
import FeaturesHome from '../components/home/FeaturesHome';
import GalleryHome from '../components/home/GalleryHome';
import HowItWorks from '../components/home/HowItWorks';
import HomeCTA from '../components/home/HomeCTA';

export default function Page() {
  return (
    <>
      {/*  Page illustration */}
      <div className="relative max-w-6xl mx-auto" aria-hidden="true">
        <HeroHome />

        <FeaturesHome />

        <FeatureItems />

        <GalleryHome />

        <HowItWorks />

        <HomeCTA />
      </div>
    </>
  )
}

Page.getLayout = function getLayout(page) {
  return (
    <MainLayout>
      {page}
    </MainLayout>
  )
}