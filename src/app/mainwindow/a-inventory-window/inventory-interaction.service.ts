import { Injectable } from '@angular/core';
import { Inventory } from './inventory.model';


import { Subject } from 'rxjs';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

const InventorySchema = '../../../../backend/models/inventory.js';

@Injectable({
  providedIn: 'root'
})

export class InventoryInteractionService {

  private inventory: Inventory[] = [];
  private inventoryUpdated = new Subject<Inventory[]>();
  private inventoryi: Inventory[] = [];
  private inventoryUpdatedi = new Subject<Inventory[]>();

  constructor(private http: HttpClient, private router : Router){}

  getInventory(itemsPerPage: number , currentPage:number) {
    const queryParams = `?pagesize=${itemsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, inventorys: any}>('http://localhost:3000/api/inventory' + queryParams)
    .pipe(map(inventoryData => {
     return inventoryData.inventorys.map(inventory=>{
       return{
        email: inventory.email,
        name: inventory.name,
        quantity:inventory.quantity,
        batchId:inventory.batchId,
        expireDate: inventory.expireDate,
        price: inventory.price,
        id: inventory._id,
        imagePath:  inventory.imagePath
       }
     })
    }))
    .subscribe((transformedInventory)=>{
      this.inventory = transformedInventory;
      this.inventoryUpdated.next([...this.inventory])
    });

  }


  getExpiredInventory(){
    this.http.get<{message: string, inventorys: any}>('http://localhost:3000/api/inventory/getExpired')
    .pipe(map(inventoryData => {
     return inventoryData.inventorys.map(inventory=>{
       return{
        email: inventory.email,
        name: inventory.name,
        quantity:inventory.quantity,
        batchId:inventory.batchId,
        expireDate:new Date(inventory.expireDate),
        price: inventory.price,
        id: inventory._id,
        imagePath:  inventory.imagePath
       }
     })
    }))
    .subscribe((transformedInventory)=>{
      this.inventory = transformedInventory;
      this.inventoryUpdated.next([...this.inventory])
    });
  }

  getAboutToExpireInventory(){
    this.http.get<{message: string, inventorys: any}>('http://localhost:3000/api/inventory/getAboutToExpire')
    .pipe(map(inventoryData => {
     return inventoryData.inventorys.map(inventory=>{
       return{
        email: inventory.email,
        name: inventory.name,
        quantity:inventory.quantity,
        batchId:inventory.batchId,
        expireDate:new Date(inventory.expireDate),
        price: inventory.price,
        id: inventory._id,
        imagePath:  inventory.imagePath
       }
     })
    }))
    .subscribe((transformedInventory)=>{
      this.inventory = transformedInventory;
      this.inventoryUpdated.next([...this.inventory])
    });
  }

  // getItemsOfId(id: string){
  //   this.http.get<{message: string, inventorys: any}>('http://localhost:3000/api/inventory/' + id)
  //   .pipe(map(inventoryData => {
  //     return inventoryData.inventorys.map(inventory=>{
  //       return{
  //        name: inventory.name,
  //        quantity:inventory.quantity,
  //        batchId:inventory.batchId,
  //        expireDate: inventory.expireDate,
  //        id: inventory._id,
  //        imagePath:  inventory.imagePath
  //       }
  //     })
  //    }))
  //     .subscribe(() =>{
  //       const inventoryUpdated = this.inventory.filter(inventory => inventory.id !== id);
  //       this.inventory = inventoryUpdated;
  //       this.inventoryUpdated.next([...this.inventory])
  //     });
  //   }



  getInventoryUpdateListener() {
    return this.inventoryUpdated.asObservable();
  }

  getInventorys(id: string){
    return this.http.get<{_id: string, email: string  , name: string, quantity: string, batchId: string, expireDate: string, price:string ,imagePath:string}>
    ('http://localhost:3000/api/inventory/' + id);
  }

  addInventory( email: string, name: string, quantity: string, batchId: string, expireDate: string, price: string , image: File) {
    const inventoryData = new FormData();
    inventoryData.append("email", email);
    inventoryData.append("name", name);
    inventoryData.append("quantity", quantity);
    inventoryData.append("batchId", batchId);
    inventoryData.append("expireDate", expireDate);
    inventoryData.append("price", price);
    inventoryData.append("image", image, name);

    this.http.post<{message: string, inventory: Inventory}>('http://localhost:3000/api/inventory',inventoryData)
    .subscribe((responseData)=>{
      const inventory: Inventory ={id: responseData.inventory.id,
                                   email:email ,
                                   name:name ,
                                   quantity: quantity,
                                   batchId: batchId ,
                                   expireDate: expireDate ,
                                   price: price,
                                   imagePath : responseData.inventory.imagePath};

      this.inventory.push(inventory);
      this.inventoryUpdated.next([...this.inventory]);
      this.router.navigate(["/inventory/create"]);
    });

  }

  updateInventory(id: string , email: string ,name: string, quantity: string, batchId: string, expireDate: string, price: string ,image: File | string){

    let inventoryData: Inventory | FormData;

    if (typeof(image)==='object'){
      inventoryData = new FormData();
      inventoryData.append("id", id);
      inventoryData.append("email",email);
      inventoryData.append("name",name);
      inventoryData.append("quantity",quantity);
      inventoryData.append("batchId",batchId);
      inventoryData.append("expireDate",expireDate);
      inventoryData.append("price",price);
      inventoryData.append("image", image, name);

    } else{
       inventoryData  ={id : id ,
                        email : email ,
                        name : name ,
                        quantity : quantity ,
                        batchId : batchId ,
                        expireDate : expireDate ,
                        price: price,
                        imagePath: image};
    }
    this.http
             .put('http://localhost:3000/api/inventory/' + id , inventoryData)
             .subscribe(response => {
               const updatedInventorys = [...this.inventory];
               const oldInventoryIndex = updatedInventorys.findIndex(i => i.id === id);

               const inventory : Inventory ={id : id ,
                                             email : email ,
                                             name : name ,
                                             quantity : quantity ,
                                             batchId : batchId ,
                                             expireDate : expireDate ,
                                             price: price,
                                             imagePath: " "};
               updatedInventorys[oldInventoryIndex] = inventory;
               this.inventoryUpdated.next([...this.inventory]);
               this.router.navigate(["/inventory/create"]);
             });
  }

  deleteInventory(inventoryId: string) {
    this.http.delete('http://localhost:3000/api/inventory/' + inventoryId)
      .subscribe(() =>{
        const inventoryUpdated = this.inventory.filter(inventory => inventory.id !== inventoryId);
        this.inventory = inventoryUpdated;
        this.inventoryUpdated.next([...this.inventory])
      });
  }
}
