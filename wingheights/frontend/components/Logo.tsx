import React from "react"
import Image from "next/image"

const Logo = () => {
  return (
    <div className="logo h-auto bg-white bg-opacity-30 rounded ">
      <Image 
        src="/logo.png" 
        height={96} // Increase the height
        width={144}  // Increase the width
        alt="Wing Heights Insurance Brokers Limited"
        className="h-fit w-auto object-fill"
        priority
      />
    </div>
  )
}

export default Logo