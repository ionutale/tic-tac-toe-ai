const Square = (props) => {
  const visual = props.value
  ? `square animate__animated animate__flipInX animate__faster ${props.glow}`
  : "square";

  return (
    <button className={visual} onClick={props.onClick}>
      {props.value} 
    </button>
  )
}

export default Square;