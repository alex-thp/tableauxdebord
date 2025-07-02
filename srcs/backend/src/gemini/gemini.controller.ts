import { GenerateImagesConfig } from '@google/genai';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {

    constructor(private geminiService: GeminiService) {}
    
  @Post('default')
  async askGemini(@Body('question') question: string): Promise<any> {
      console.log('Question reçue :', question); 

    return this.geminiService.askGemini(question);
  }
}
