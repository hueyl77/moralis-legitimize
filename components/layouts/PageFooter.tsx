interface Props {

}

const PageFooter: React.FC<Props> = ({ children }) => {

  return (
    <footer className="footer relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 p-12 text-center">
        <div className="text-gray-600 dark:text-gray-400 text-sm mr-4">&copy; 2022 Legitimize Technologies. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default PageFooter;
