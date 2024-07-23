/* eslint-disable react/prop-types */

const TrackCard = ({title, artist, artwork}) => {

    return (
        <div className="trackCard">
            <img src={artwork} alt={title + ' Artwork'} />
            <h1>{title}</h1>
            <p>{artist}</p>
        </div>
    )
}

export default TrackCard
