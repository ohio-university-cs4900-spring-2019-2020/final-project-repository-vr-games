#!/usr/bin/env python
#Requires Python 3.0 or greater

#Test suite. Assumes subfolder 'test' of current path contains test files.
#python regEx.py "([a-z]*)_([a-z]*)_([a-z]*)" "\2_\3_\1" test\*.txt
#python regEx.py "([a-z]*)_([a-z]*)_([a-z]*)_([a-z]*)_([a-z]*)_([a-z]*)_([a-z]*)" "\5_\7_\2_\6_\3_\4_\1" test\*
#python regEx.py foo bar test\foo1 test\foo2
#python regEx.py foo bar test\*
#python regEx.py "---*" "-" test\*-*

import sys
import os
import os.path
import glob
import re
import string

def isUniqueNewFile( newFileName, listOfNewFiles ):
   for i in listOfNewFiles:
      if newFileName == i:
         return 0
         
   if os.path.exists( newFileName ):
      print( "WARNING: File Already exists - '", newFileName, "'... Renaming against", sep='' )
      print( "         regex causes two originally unique files to have the same name...", sep='' )
      print( "         Not renaming mentioned file...", sep='' )
      return 0
         
   listOfNewFiles.append( newFileName )
   return 1

def refactorTextWithinFile( oldFileName, regExp, re2 ):   
   file = open( oldFileName, 'r' ) #Open file for reading
   strTextOrig = file.read()
   strOut = regExp.sub( re2, strTextOrig )
   file.close()
   
   if( strTextOrig == strOut ):
      print( "   Nothing to refactor in '", oldFileName, "'...", sep='' )
      return
      
   file = open( oldFileName, 'w' ) #Clears file to empty
   file.write( strOut )
   file.close()
   print( "Refactored Code In: '", oldFileName, "'...", sep='' )
   
   

if( len( sys.argv ) < 3 ):
   print( "Usage (from usr/modules/): renameModule.py OldModuleName NewModuleName" )
   quit()

re1 = sys.argv[1]
re2 = sys.argv[2]
print( "re1 is '",re1,"'",sep='' )
print( "re2 is '",re2,"'",sep='' )
regExp = re.compile(re1)

listOfNewFiles = list()

#Enter into the module's directory, refactor text in each file followed by renaming that file.
#After all subdirectories specified in the oldFileNames list are refactored / renamed,
#then rename the parent folder
os.chdir( './' + re1 )
print( "work dir is '", os.getcwd(), "'...", sep='' )
#for i in range( 3, len(sys.argv) ):
oldFileNames =  list( glob.glob( './src/*.cpp' ) )
oldFileNames += list( glob.glob( './src/*.h' ) )
oldFileNames += list( glob.glob( './src/CMakeLists.txt' ) )
oldFileNames += list( glob.glob( './win32/*.sln' ) )
oldFileNames += list( glob.glob( './win32/*.vcproj' ) )
oldFileNames += list( glob.glob( './win/*.sln' ) )
oldFileNames += list( glob.glob( './win/*.vcproj' ) )
oldFileNames += list( glob.glob( './win/*.vcxproj' ) )
oldFileNames += list( glob.glob( './win/*.vcxproj.filters' ) )
oldFileNames += list( glob.glob( './win/*.sln.old' ) )

for j in oldFileNames:
   oldFileName = os.path.relpath( j )
   #print( oldFileName )
   result = regExp.sub( re2, oldFileName )
   newFileName = os.path.relpath( result )
   refactorTextWithinFile( oldFileName, regExp, re2 )
   if oldFileName != newFileName:
      if isUniqueNewFile( newFileName, listOfNewFiles ) == 1:
         print( "Renaming File: '", oldFileName,"' to '", newFileName, "'", sep='' )
         os.rename( oldFileName, newFileName )         
      else:
         print( "WARNING: File already exists '", newFileName,"', will not 'stomp' this file.", sep='' )
         print( "   NOT Renaming '", oldFileName, "' to '",newFileName,"' continuing script.", sep='' )

#finally, rename the parent folder
os.chdir( '../' )
os.rename( re1, re2 ) #rename the folder
print( "Renamed Directory '", re1, "' to '", re2, "'...", sep='' )
print( "Refactoring Complete...")