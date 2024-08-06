import { useEffect, useState, useContext } from 'react';
import { getAllSurveys, deleteSurvey } from '../services/survey.service';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../state/app.context';
import './CSS/SurveyList.css';
import Button from '../components/beerbutton';
import DeleteButton from '../components/deletebutton';

export default function SurveyList() {
    const [surveys, setSurveys] = useState([]);
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        getAllSurveys().then(setSurveys);
    }, []);

    const isAdminOrModerator = userData && (userData.role === 'admin' || userData.role === 'moderator');

    const handleRemoveSurvey = async (surveyId) => {
        if (window.confirm('Are you sure you want to delete this survey?')) {
            try {
                await deleteSurvey(surveyId);
                setSurveys(surveys.filter(survey => survey.id !== surveyId));
                alert('Survey removed successfully.');
            } catch (error) {
                console.error('Error removing survey:', error);
                alert('Failed to remove survey. Please try again.');
            }
        }
    };

    return (
        <div className="survey-list-container">
            <h1 className="survey-list-title">Available Surveys</h1>
            {isAdminOrModerator && (
                <Button
                    text="Add Survey"
                    onClick={() => navigate('/add-survey')}
                />
            )}
            {surveys.map((survey) => (
                <div className="survey-item" key={survey.id}>
                    <Link className="survey-link" to={`/survey/${survey.id}`}>{survey.title}</Link>
                    {isAdminOrModerator && (
                        <DeleteButton
                            onClick={() => handleRemoveSurvey(survey.id)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}