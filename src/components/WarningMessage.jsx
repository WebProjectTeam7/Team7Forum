// /* eslint-disable indent */
// import { useEffect, useState } from 'react';
// import errorGif from '../image/error.gif';
// import { PASSWORD_STRENGTH_LOW_LENGTH } from '../common/constants';
// import './CSS/ErrorMessage.css';

// const ErrorComponent = () => {
//   const [errors, setErrors] = useState({});
//   const [data, setData] = useState({
//     username: '',
//     email: '',
//     firstName: '',
//     lastName: '',
//     password: '',
//     confirmPassword: ''
//   });

//   useEffect(() => {
//     const validate = () => {
//       let newErrors = {};

//       if (!data.username) newErrors.username = 'Username is required';
//       if (!data.email) newErrors.email = 'Email is required';
//       if (data.email && !/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Email is invalid';
//       if (!data.firstName) newErrors.firstName = 'First name is required';
//       if (!data.lastName) newErrors.lastName = 'Last name is required';
//       if (!data.password) newErrors.password = 'Password is required';
//       // eslint-disable-next-line max-len
//       if (data.password && data.password.length < PASSWORD_STRENGTH_LOW_LENGTH) newErrors.password = `Password must be at least ${PASSWORD_STRENGTH_LOW_LENGTH} characters`;

//       setErrors(newErrors);
//     };

//     validate();
//   }, [data]);


//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (Object.keys(errors).length === 0) {
//       console.log('Form is valid, submit data');
//     } else {
//       console.log('Form has errors');
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Username"
//           value={data.username}
//           onChange={(e) => setData({ ...data, username: e.target.value })}
//         />
//         {errors.username && <div className="error">{errors.username}</div>}

//         <input
//           type="email"
//           placeholder="Email"
//           value={data.email}
//           onChange={(e) => setData({ ...data, email: e.target.value })}
//         />
//         {errors.email && <div className="error">{errors.email}</div>}

//         <input
//           type="text"
//           placeholder="First Name"
//           value={data.firstName}
//           onChange={(e) => setData({ ...data, firstName: e.target.value })}
//         />
//         {errors.firstName && <div className="error">{errors.firstName}</div>}

//         <input
//           type="text"
//           placeholder="Last Name"
//           value={data.lastName}
//           onChange={(e) => setData({ ...data, lastName: e.target.value })}
//         />
//         {errors.lastName && <div className="error">{errors.lastName}</div>}

//         <input
//           type="password"
//           placeholder="Password"
//           value={data.password}
//           onChange={(e) => setData({ ...data, password: e.target.value })}
//         />
//         {errors.password && <div className="error">{errors.password}</div>}

//         <input
//           type="password"
//           placeholder="Confirm Password"
//           value={data.confirmPassword}
//           onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
//         />

//         <button type="submit">Submit</button>
//       </form>

//       {Object.keys(errors).length > 0 && (
//         <div className="error-message">
//           <img src={errorGif} alt="Error" />
//           <p>Something went wrong. Please check the form for errors.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ErrorComponent;
