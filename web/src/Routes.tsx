import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header from './Header';
import Bye from './pages/Bye';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function Routes() {
  return (
    <BrowserRouter>
      <Header />
      <div>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/register' component={Register} />
          <Route exact path='/bye' component={Bye} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default Routes;
