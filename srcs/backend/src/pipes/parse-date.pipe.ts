import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date | null> {
  transform(value: string): Date | null {
    if (value === '' || value === 'null' || value === 'undefined') {
      return null;
    }

    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Date invalide');
    }

    return date;
  }
}