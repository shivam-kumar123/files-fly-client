import React from 'react'
import './Loader.css'

const Loader = () => {
  return (
    <div className="container">
        <div className="folder">
            <div className="top"></div>
            <div className="bottom"></div>
        </div>
        <div className="title"><h3>getting files ready...</h3></div>
    </div>
  )
}

export default Loader