"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var InvoicesTableComponent = (function () {
    function InvoicesTableComponent() {
        this.selectedChange = new core_1.EventEmitter();
        this.orderChange = new core_1.EventEmitter();
        this.orderWayChange = new core_1.EventEmitter();
    }
    InvoicesTableComponent.prototype.getSum = function (key) {
        if (!this.invoices)
            return 0;
        return this.invoices.reduce(function (a, b) { return a + (b.data && b.data[key] ? parseFloat(b.data[key]) : 0); }, 0);
    };
    InvoicesTableComponent.prototype.orderBy = function (key) {
        if (this.order == key) {
            this.orderWay = this.orderWay == 'asc' ? 'desc' : 'asc';
            this.orderWayChange.emit(this.orderWay);
        }
        else {
            if (this.orderWay !== 'asc') {
                this.orderWay = 'asc';
                this.orderWayChange.emit(this.orderWay);
            }
            this.orderChange.emit(key);
        }
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], InvoicesTableComponent.prototype, "selectedChange");
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], InvoicesTableComponent.prototype, "orderChange");
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], InvoicesTableComponent.prototype, "orderWayChange");
    InvoicesTableComponent = __decorate([
        core_1.Component({
            selector: 'invoices-table',
            moduleId: module.id,
            templateUrl: 'invoices-table.component.html',
            inputs: ['invoices', 'selected', 'order', 'orderWay']
        }), 
        __metadata('design:paramtypes', [])
    ], InvoicesTableComponent);
    return InvoicesTableComponent;
}());
exports.InvoicesTableComponent = InvoicesTableComponent;
