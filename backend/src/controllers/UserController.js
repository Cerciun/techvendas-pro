class UserController { 
  async auth(req, res) { 
    try { 
      res.json({ message: 'Usuário autenticado' }); 
    } catch (error) { 
      res.status(500).json({ error: error.message }); 
    } 
  } 
} 
module.exports = new UserController(); 
