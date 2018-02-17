const ast = {
  "История.sts": {
    type: "module",
    operations: [
      {
        type: 'call',
        name: 'Output.Write',
        arguments: [
          {
            type: 'string',
            value: 'Давным-давно в далекой-далекой галактике...'
          },
          {
            type: 'string',
            value: '\r'
          },
          {
            type: 'string',
            value: 'Жил да был Зайчик-Джедайчик'
          },
          {
            type: 'string',
            value: '\r'
          },
        ]
      },
      {
        type: 'block',
        operations: [
          {
            type: 'call',
            name: 'Context.SetValue',
            arguments: [
              {
                type: 'string',
                value: 'Год'
              },
              {
                type: 'number',
                value: 2590,
              }
            ]
          }
        ]
      },
      {
        type: 'call',
        name: 'Output.Write',
        arguments: [
          {
            type: 'string',
            value: 'На дворе стоял '
          },
          {
            type: 'call',
            name: 'Context.GetValue',
            arguments: [
              {
                type: 'string',
                value: 'Год'
              }
            ]
          },
          {
            type: 'string',
            value: ' от торжества простого'
          },
          {
            type: 'string',
            value: '\r'
          },
        ]
      }
    ]
  }
}
