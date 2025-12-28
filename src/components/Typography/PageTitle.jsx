import React from 'react'
import Skeleton from 'react-loading-skeleton'

const PageTitle = ({ children }) => {
  return (
    <h1 className="lg:my-4 my-3 text-2xl font-bold text-gray-700 dark:text-gray-300">
      {children ? children : <Skeleton width={150} height={27} />}
    </h1>
  )
}

export default PageTitle