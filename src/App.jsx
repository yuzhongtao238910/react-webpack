import React, {lazy, Suspense} from "react"

import { Link, Routes, Route } from "react-router-dom";
const Home = lazy(() => import(/* webpackChunkName: 'home' */"./pages/Home")) 
const About = lazy(() => import(/* webpackChunkName: 'about' */"./pages/About")) 
const App = () => {
  return (
  	<div>
      <h1>app-23891222220</h1>
      
      <ul>
      	<li><Link to="/home">home</Link></li>
      	<li><Link to="/about">about</Link></li>
      </ul>
      <Suspense fallback={<div>loading</div>}>
      	<Routes>
      		<Route path="/home" element={<Home></Home>}></Route>
      		<Route path="/about" element={<About></About>}></Route>
      	</Routes>
      	</Suspense>
    </div>
  )
}
export default App