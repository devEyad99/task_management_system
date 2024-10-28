import { Request, Response } from 'express';
import {
  controller,
  get,
  post,
  put,
  del,
  patch,
  use,
  bodyValidator,
} from '../decorators';
import { authenticate } from '../middlewares/authenticate';

@controller('/test')
class TestController {
  @get('/')
  getTest(req: Request, res: Response) {
    console.log('GET /test/');
    res.send('get test');
  }

  @post('/testpost')
  @bodyValidator('name')
  postTest(req: Request, res: Response) {
    const { name } = req.body;
    res.send(`post test ${name}`);
  }

  @get('/testprotected')
  @use(authenticate)
  protectedTest(req: Request, res: Response) {
    res.send('protected test');
  }

  @put('/testput')
  putTest(req: Request, res: Response) {
    res.send('put test');
  }

  @del('/testdel')
  deleteTest(req: Request, res: Response) {
    res.send('delete test');
  }

  @patch('/testpatch')
  patchTest(req: Request, res: Response) {
    res.send('patch test');
  }
}
