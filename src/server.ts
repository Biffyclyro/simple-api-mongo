import cors from "cors";
import express from "express";
import mongoose from 'mongoose'

interface Dto<T> {
  info?: string;
  data?: T;
}

mongoose.connect('mongodb://localhost/blasterman', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const battlefieldMap = new mongoose.Schema({
  tiles: String,
  breakableBlocks: [{ x: Number, y: Number }],
  background: { key: String, url: String }
});

const BfModel = mongoose.model('BfModel', battlefieldMap);
const port = 8080
const app: express.Application = express();
app.use(express.json());
const router = express.Router();
app.use(cors());
app.use(router);

router.get('/map/:id', async (req: express.Request,
  res: express.Response) => {
  const id = req.params.id;
  if (id) {
    const map = await BfModel.findById(id);
    res.send({ info: map._id, data: map });
  }
});

router.get('/getMaps', async (req: express.Request,
  res: express.Response) => {
  const map = await BfModel.find();
  res.send(map );
});
router.delete('/:id', async (req: express.Request,
  res: express.Response) => {

  const id = req.params.id;
  const map = await BfModel.findById(id);
  map.remove();
  res.send({ info: 'deletado' });
});

router.post('/update/:id', async (req: express.Request,
  res: express.Response) => {
  const id = req.params.id;
  const updatedMap = req.body;
  const map = await BfModel.findByIdAndUpdate(id, updatedMap, { new: true });
  res.send({ info: map._id, data: map });
});

router.post('/', async (req: express.Request,
  res: express.Response) => {

  const { tiles, breakableBlocks, background } = req.body;
  const map = await BfModel.create({ tiles, breakableBlocks, background });

  res.send({ info: map._id, data: map });
});

const server = app.listen(port);