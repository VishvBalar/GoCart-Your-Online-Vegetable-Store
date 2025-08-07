import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/categories'
import BestSeller from '../components/BestSeller'

function Home() {
  return (
    <div className='mt-10'>
        <MainBanner/>
        <Categories/>
        <BestSeller/>
    </div>
  )
}


export default Home