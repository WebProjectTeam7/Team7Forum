import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSurvey } from "../services/survey.service";
import BeerRating from "../components/BeerRating";

export default function Survey() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSurvey(id)
      .then((data) => {
        setSurvey(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!survey) return <div>Survey not found</div>;

  return (
    <div>
      <h1>{survey.title}</h1>
      <p>{survey.description}</p>
      <div>
        {Array.isArray(survey.choices) ? (
          survey.choices.map((choice) => (
            <div key={choice.id}>
              <h3>{choice.text}</h3>
              <BeerRating
                choiceId={choice.id}
                surveyId={survey.id}
                rating={choice.rating || 0}
              />
            </div>
          ))
        ) : (
          <p>No choices available</p>
        )}
      </div>
    </div>
  );
}

// import { useContext, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { AppContext } from "../state/app.context";
// import { getSurvey, rateChoice } from "../services/survey.service";
// import BeerRating from "../components/BeerRating";

// export default function Survey() {
//   const { id } = useParams();
//   const { user } = useContext(AppContext);
//   const [survey, setSurvey] = useState(null);

//   useEffect(() => {
//     if (id) {
//       getSurvey(id)
//         .then((data) => setSurvey(data))
//         .catch((e) => alert(e.message));
//     }
//   }, [id]);
//   const handleRate = (choiceId, rating) => {
//     if (user) {
//       rateChoice(id, choiceId, user.uid, rating)
//         .then(() => alert("Rating submitted!"))
//         .catch((error) => alert(error.message));
//     } else {
//       alert("You must be logged in to rate.");
//     }
//   };

//   return (
//     <div>
//       <h1>{survey?.title}</h1>
//       <p>{survey?.description}</p>
//       {survey?.choices &&
//         survey.choices.map((choice) => (
//           <div key={choice.id}>
//             <h3>{choice.text}</h3>
//             <p>Average Rating: {choice.averageRating ?? "No ratings yet"}</p>
//             {user && (
//               <BeerRating
//                 rating={choice.userRating ?? 0}
//                 onRate={(rating) => handleRate(choice.id, rating)}
//               />
//             )}
//           </div>
//         ))}
//     </div>
//   );
// }
