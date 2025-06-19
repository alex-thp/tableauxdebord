import { IsNumberString } from 'class-validator';

export class MergeDto {
  @IsNumberString()
  fromFile1: string;

  @IsNumberString()
  toFile1: string;

  @IsNumberString()
  fromFile2: string;

  @IsNumberString()
  toFile2: string;
}
