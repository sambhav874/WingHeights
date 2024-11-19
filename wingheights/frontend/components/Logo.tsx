import React from "react"
import Image from "next/image"

const Logo = () => {
  return (
    <div className="logo h-auto min-w-fit rounded ">
      <Image 
        src="/logo1.png" 
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