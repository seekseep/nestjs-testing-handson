import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module.js';

@Module({
  imports: [NotesModule],
})
export class AppModule {}
