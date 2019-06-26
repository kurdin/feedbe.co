var Item = $$.component({
  render: function (compile) {
    return compile(
      '<li>',
        this.props.label,
      '</li>'
    );
  }
});
var List = $$.component({
  compileItems: function (compile) {
    return compile(
      Item({label: this.item})
    );
  },
  render: function (compile) {
    var items = this.map(['foo', 'bar'], this.compileItems);
    return compile(
      '<ul>',
        Item({label: 'First in list'}),
        items,
      '</ul>'
    );
  }
});

module.exports = List;