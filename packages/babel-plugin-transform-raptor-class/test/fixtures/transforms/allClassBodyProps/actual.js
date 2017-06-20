export default class Text {
    @api publicProp;
    privateProp;

    @api get aloneGet(){}

    @api get myget(){}
    @api set myget(x){ return 1; }

    @api m1(){}
    m2(){}

    static ctor = "ctor";
    static get ctorGet () { return 1}

    render () {}
}
