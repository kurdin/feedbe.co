const loginQuery = `mutation ($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    id
    username    
    token
  }
}`;

module.exports = loginQuery;
