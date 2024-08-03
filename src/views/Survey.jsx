import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addRating,
  getAverageRating,
  getSurvey,
} from "../services/survey.service";
import BeerRating from "../components/BeerRating";
import { AppContext } from "../state/app.context";

export default function Survey() {
  const [survey, setSurvey] = useState(null);
  const [ratings, setRatings] = useState({});
  const { id } = useParams();
  const { user } = useContext(AppContext);

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
      alert("You must be logged in to rate!");
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

  return (
    <div>
      <h1>{survey.question}</h1>
      {Object.entries(survey.choices).map(([choiceId, choice]) => (
        <div key={choiceId}>
          <p>{choice.text}</p>
          <BeerRating
            rating={ratings[choiceId]}
            onRate={(rating) => handleRate(choiceId, rating)}
          />
          <p>Average Rating: {ratings[choiceId] ?? 0} 🍺</p>
        </div>
      ))}
    </div>
  );
}
