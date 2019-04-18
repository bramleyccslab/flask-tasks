import uuid

from pony.orm import *

from app import db
from app.utils.random_order import Fixed, Random


'''

Explanation
-----------

Everything in this file should be left alone, apart from
the YourTask class. This class should specify the data 
fields you wish to capture from the task.

To interface with the database, all classes use the Pony
Object-Relational Mapper. Documentation concerning database
objects can be found at: https://docs.ponyorm.org/entities.html

'''



class TasksCompleteError(Exception):
    ''' Exception returned by Tasks when completed'''
    pass


'''
    TASK_ORDER is a list of tasks, that should also be registered 
    with the @tasks.register decorator in views.py.

    There is a 'Random' class that randomises the order, if required.
    Ask Richard Hadden for more information if you wish to add more tasks
    and/or randomise the order. ('A marvellous solution, which this comment
    is too small to contain...')



'''
TASK_ORDER= Fixed(
            'NOT_STARTED', 
            'STARTED',
            'GET_INSTRUCTIONS',
            'GET_COMPREHENSION',
            'GET_TASK',
            'GET_POSTTEST',
            'POST_RESULTS',
        )



class Participant(db.Entity):
    ''' 
    The Participant model.
    
    Keeps track of the participant state and advances through states
    as specified in TASK_ORDER. 

    '''
    id = PrimaryKey(uuid.UUID)
    task_order = Required(StrArray, default=lambda: list(TASK_ORDER))
    current_state = Required(str, default='NOT_STARTED')
    tasks = Set('Task')

    
    def advance_state(self):
        ''' Method to track state of user and advance through task states '''

        if self.current_state == 'DONE':
            raise TasksCompleteError

        current_state_index = self.task_order.index(self.current_state)
        
        try:
            self.current_state = self.task_order[current_state_index + 1]
        except (IndexError):
            self.current_state = 'DONE'
            raise TasksCompleteError



class Task(db.Entity):
    ''' Generic task instance '''
    participant = Required('Participant')



class YourTask(Task): # <-- Change the name of your task
    ''' Here define the required database fields '''
    score = Required(int) # Is an integer
    thingy = Required(str) # Is a text field


    # See Pony documentation for field types: https://docs.ponyorm.org/api_reference.html#attribute-types