/* eslint-disable react/prop-types */
import TrackCard from "./trackCard"



const TrackCardContainer = ({array}) => {
    
    return (
        <div className="trackCardContainer">
            <TrackCard title= {'skipping Tiles'} artist={'julie'} artwork={'https://i.scdn.co/image/ab67616d0000b2730a4a4412593bd5bfc5e9844b'}/>  
            {array.map(n => <TrackCard title={n.title} artist={n.artist} artwork={n.artwork} key={n.title}/>)} 
        </div>
        
    )
}
export default TrackCardContainer