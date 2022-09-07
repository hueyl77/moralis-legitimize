import MainLayout from '../components/layouts/MainLayout'
import PageIllustration from '../components/shared/PageIllustration'
import HeroHome from '../components/home/HeroHome';

export default function Page() {
  return (
    <>
      {/*  Page illustration */}
      <div className="relative max-w-6xl mx-auto" aria-hidden="true">
        <HeroHome />
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