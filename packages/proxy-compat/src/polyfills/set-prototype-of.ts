
export function setPrototypeOf (obj: any, proto: any): any {
	obj.__proto__ = proto;
	return obj;
}