import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { useRegisterMutation } from 'src/generated/graphql';

interface RegisterProps {}

const Register: React.FC<RegisterProps & RouteComponentProps> = ({
  history,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register] = useRegisterMutation();

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const response = await register({
            variables: {
              email,
              password,
            },
          });

          console.log(response);
          history.push('/');
        }}
      >
        <div>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type='submit'>Register</button>
      </form>
    </div>
  );
};

export default Register;
