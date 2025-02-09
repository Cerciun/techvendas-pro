class ProductController { 
  async index(req, res) { 
    try { 
      res.json({ message: 'Listagem de produtos' }); 
    } catch (error) { 
      res.status(500).json({ error: error.message }); 
    } 
  } 
} 
module.exports = new ProductController(); 
