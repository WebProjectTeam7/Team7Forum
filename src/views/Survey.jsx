/* eslint-disable func-style */
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    addRating,
    getAverageRating,
    getSurvey,
} from '../services/survey.service';
import BeerRating from '../components/BeerRating';
import { AppContext } from '../state/app.context';
import './CSS/Survey.css';

export default function Survey() {
    const [survey, setSurvey] = useState(null);
    const [ratings, setRatings] = useState({});
    const { id } = useParams();
    const { user, userData } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSurvey() {
            try {
                const surveyData = await getSurvey(id);
                setSurvey(surveyData);
                const ratings = {};
                for (const choiceId in surveyData.choices) {
                    const avgRating = await getAverageRating(id, choiceId);
                    ratings[choiceId] = avgRating;
                }
                setRatings(ratings);
            } catch (error) {
                console.error(error);
            }
        }

        fetchSurvey();
    }, [id]);

    const handleRate = async (choiceId, rating) => {
        if (!user) {
            alert('You must be logged in to rate!');
            return;
        }

        try {
            await addRating(id, choiceId, user.uid, rating);
            const avgRating = await getAverageRating(id, choiceId);
            setRatings({ ...ratings, [choiceId]: avgRating });
        } catch (error) {
            console.error(error);
        }
    };

    if (!survey) return <div>Loading...</div>;

    const isAdminOrModerator = userData && (userData.role === 'admin' || userData.role === 'moderator');

    return (
        <div className="survey-container">
            <h1 className="survey-title">{survey.title}</h1>
            <p className="survey-description">{survey.description}</p>
            {isAdminOrModerator && (
                <button className="survey-button" onClick={() => navigate(`/edit-survey/${id}`)}>Edit</button>
            )}
            <h1 className="survey-question">{survey.question}</h1>
            {Object.entries(survey.choices).map(([choiceId, choice]) => (
                <div className="survey-choice" key={choiceId}>
                    {choice.image && <img src={choice.image} alt={choice.text} style={{  width: '50px', height: '50px' }} />}
                    <p>{choice.text}</p>
                    <BeerRating
                        rating={ratings[choiceId]}
                        onRate={(rating) => handleRate(choiceId, rating)}
                    />
                    <p className="average-rating">Average Rating: {ratings[choiceId] ?? 0} 🍺</p>
                </div>
            ))}
        </div>
    );
}
