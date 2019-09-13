import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class CustomerListPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (args) {
      // const cf = value.filter((c: any) => c.name.toLowerCase() === args.toLowerCase());
      return value.filter((c: any) => c.DisplayText.toLowerCase().includes(args) 
      // || c.Name.toLowerCase().includes(args) ||
      //   c.Customer_ID.toString().includes(args) 
        );
    }
    return value;
    // return null;
  }

}
